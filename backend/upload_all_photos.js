/**
 * Upload seluruh foto dari Downloads/places/<folder> ke Supabase Storage.
 * Menerima file apa saja: .jpg .jpeg .png .webp
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Lokasi folder places di Downloads user
const downloads = path.join(require("os").homedir(), "Downloads");
const placesFolder = path.join(downloads, "places");

async function uploadAll() {
  console.log("📁 Folder sumber:", placesFolder);

  // baca semua folder
  const folders = fs.readdirSync(placesFolder);

  for (const folder of folders) {
    const folderPath = path.join(placesFolder, folder);

    // skip kalau bukan folder
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const ext = file.toLowerCase();

      // Hanya upload file gambar
      if (
        !(ext.endsWith(".jpg") ||
          ext.endsWith(".jpeg") ||
          ext.endsWith(".png") ||
          ext.endsWith(".webp"))
      ) {
        console.log(`⚠️  Skip (bukan gambar): ${file}`);
        continue;
      }

      const filePath = path.join(folderPath, file);
      const fileBuffer = fs.readFileSync(filePath);

      const supabasePath = `${folder}/${file}`;

      console.log(`⬆️  Uploading → ${supabasePath}`);

      const { error } = await supabase.storage
        .from("places")
        .upload(supabasePath, fileBuffer, {
          upsert: true,
          contentType: getContentType(file),
        });

      if (error) {
        console.log(`❌ Error: ${supabasePath} — ${error.message}`);
      } else {
        console.log(`✅ Uploaded: ${supabasePath}`);
      }
    }
  }

  console.log("\n🎉 SELESAI — Semua foto berhasil diupload!");
}

function getContentType(filename) {
  const ext = filename.toLowerCase();
  if (ext.endsWith(".jpg") || ext.endsWith(".jpeg")) return "image/jpeg";
  if (ext.endsWith(".png")) return "image/png";
  if (ext.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

uploadAll();
