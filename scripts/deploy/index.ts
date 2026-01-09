const pushPagesSecret = () => {
  console.log("🔐 Pushing environment secrets to Pages...");

  const runtimeEnvVars = ['AUTH_GITHUB_ID', 'AUTH_GITHUB_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'AUTH_SECRET'];

  try {
    if (!existsSync(resolve('.env'))) {
      setupEnvFile();
    }

    const envContent = readFileSync(resolve('.env'), 'utf-8');
    const runtimeEnvFile = resolve('.env.runtime.json');

    // 从 .env 中解析 key/value，构造 JSON 对象
    const runtimeSecrets: Record<string, string> = {};
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (runtimeEnvVars.includes(key) && val.length > 0) {
        runtimeSecrets[key] = val;
      }
    });

    if (Object.keys(runtimeSecrets).length === 0) {
      console.log("⚠️ No runtime secrets found to push, skipping.");
      return;
    }

    // 写入 JSON 文件并调用 wrangler bulk
    writeFileSync(runtimeEnvFile, JSON.stringify(runtimeSecrets, null, 2));
    execSync(`pnpm dlx wrangler pages secret bulk ${runtimeEnvFile}`, { stdio: "inherit" });

    // 清理临时文件
    execSync(`rm ${runtimeEnvFile}`, { stdio: "inherit" });

    console.log("✅ Secrets pushed successfully");
  } catch (error) {
    console.error("❌ Failed to push secrets:", error);
    throw error;
  }
};
