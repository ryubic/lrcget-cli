import { Client } from "lrclib-api";
import fs from "fs";
import { parseFile } from "music-metadata";
import path from "path";

console.time("Time taken");

const audioExtensions = [
  ".mp3",
  ".wav",
  ".flac",
  ".aac",
  ".m4a",
  ".m4b",
  ".m4p",
  ".ogg",
  ".oga",
  ".opus",
  ".wma",
  ".alac",
  ".aiff",
  ".aif",
  ".aifc",
  ".pcm",
  ".amr",
  ".3gp",
  ".3g2",
  ".mp2",
  ".mp1",
  ".ra",
  ".rm",
  ".caf",
  ".dsd",
  ".dff",
  ".dsf",
];

try {
  const client = new Client();
  const args = process.argv.slice(2);
  let targetDir =
    args.indexOf("-d") === -1 ? process.cwd() : args[args.indexOf("-d") + 1];
  targetDir = targetDir.replace(/^["']+|["']+$/g, ""); // remove trailing slashes in path
  targetDir = path.resolve(targetDir); // get absolute path from relative path
  // let lyricsDir = path.resolve(targetDir, "lyrics")

  const itemsInDir = fs.readdirSync(targetDir, {
    withFileTypes: true,
    recursive: true,
  });
  let files = [];
  for (const item of itemsInDir) {
    if (item.isDirectory()) continue;
    let filePath = path.join(item.parentPath, item.name);
    files.push(filePath);
  }

  let results = {
    total: 0,
    synced: 0,
    plain: 0,
    instrumental: 0,
    alreadyExists: 0,
    notFound: 0,
  };

  for (const file of files) {
    const filepath_abs = path.resolve(targetDir, file);
    const filepath_rel = path.relative(targetDir, filepath_abs);
    const ext = path.extname(filepath_abs);
    if (!audioExtensions.includes(ext)) continue;
    results.total += 1;

    // skip if .lrc file already exits
    let lrcPath = `${filepath_abs.slice(0, -ext.length)}.lrc`;
    if (fs.existsSync(lrcPath)) {
      results.alreadyExists += 1;
      console.log("🟨", filepath_rel);
      continue;
    }

    const metadata = await parseFile(filepath_abs);

    const query = {
      track_name: metadata.common.title,
      artist_name: metadata.common.artist,
    };

    let lyrics = null;

    // fetch lyrics
    try {
      lyrics = await client.findLyrics(query);
    } catch (error) {
      console.error("Error fetching lyrics:", error.message);
    }

    if (!lyrics) {
      results.notFound += 1;
      console.log("🟥", filepath_rel);
      continue;
    }

    // skip if instrumental
    if (lyrics.instrumental) {
      results.instrumental += 1;
      console.log("🟦", filepath_rel);
      continue;
    }

    // save .lrc file
    if (lyrics.syncedLyrics) {
      fs.writeFileSync(lrcPath, lyrics.syncedLyrics);
      results.synced += 1;
      console.log("🟩", filepath_rel);
    } else if (lyrics.plainLyrics) {
      fs.writeFileSync(lrcPath, lyrics.plainLyrics);
      results.plain += 1;
      console.log("⬛", filepath_rel);
    } else {
      results.notFound += 1;
      console.log("🟥", filepath_rel);
    }
  }

  console.log("\n-----Results-----");
  console.log(`🟪 Total tracks:   ${results.total}`);
  console.log(`🟩 Synced:         ${results.synced}`);
  console.log(`⬛ Plain:          ${results.plain}`);
  console.log(`🟦 Instrumental:   ${results.instrumental}`);
  console.log(`🟨 Already exists: ${results.alreadyExists}`);
  console.log(`🟥 Not found:      ${results.notFound}`);
  console.timeEnd("Time taken");
} catch (error) {
  console.error(error);
}
