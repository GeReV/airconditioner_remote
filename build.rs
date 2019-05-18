use std::env;
use std::fs;
use std::path::Path;

fn main() -> std::io::Result<()> {
    let profile = env::var("PROFILE").unwrap();
    let out_dir = env::var("TARGET");

    let dest_dir = 
        if let Ok(target) = out_dir {
            Path::new("target").join(target).join(profile).join("assets")
        } else {
            Path::new("target").join(profile).join("assets")
        };

    println!("Creating dir {:?}...", dest_dir);
    fs::remove_dir_all(&dest_dir)?;
    fs::create_dir(&dest_dir)?;
    
    for entry in fs::read_dir(Path::new("dist"))? {
        let entry: fs::DirEntry = entry?;
        let src_path = entry.path();

        let file_name = src_path.file_name().unwrap();

        let dest_path = dest_dir.join(file_name);

        println!("Copying {:?} to {:?}...", src_path, dest_path);

        fs::copy(&src_path, &dest_path)?;
    }

    Ok(())
}