import bcrypt from 'bcrypt';

const senha = 'senha123';
bcrypt.hash(senha, 10).then(hash => {
  console.log('Hash gerado:', hash);
}); 