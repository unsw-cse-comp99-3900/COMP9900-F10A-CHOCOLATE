const bcrypt = require('bcryptjs');

async function generatePassword() {
    const password = '123456'; // 设置您想要的密码
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);
}

generatePassword(); 