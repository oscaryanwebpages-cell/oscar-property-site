// 初始化管理员用户脚本
// 在浏览器控制台中运行此脚本

(async function initAdminUser() {
  const { createUser } = await import("../services/firebase.ts");

  const adminEmails = [
    { email: "oscar@oscaryan.my", password: "admin123" },
    { email: "oscaryanwebpages@gmail.com", password: "admin123" },
  ];

  console.log("开始创建管理员用户...");

  for (const admin of adminEmails) {
    try {
      const user = await createUser(admin.email, admin.password);
      if (user) {
        console.log(`✅ 用户创建成功: ${admin.email}`);
      } else {
        console.log(`⚠️ 用户可能已存在: ${admin.email}`);
      }
    } catch (error) {
      console.error(`❌ 创建用户失败 ${admin.email}:`, error);
    }
  }

  console.log("完成！现在可以使用以下账户登录：");
  console.log("邮箱: oscar@oscaryan.my 或 oscaryanwebpages@gmail.com");
  console.log("密码: admin123");
})();
