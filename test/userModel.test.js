const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();



const UserMock = dbMock.define('User', {
  userId: 1,
  firstName: 'Tester',
  lastName:'Name',
  username: 'tester',
  email: 'tester@gmail.com',
  password:"1234Test"
});

describe('User Model', () => {
  it('should create a user', async () => {
    const user = await UserMock.create({
      firstName: 'New',
      lastName: 'Name',
      username:'newtester',
      email:'newtester@gmail.com',
      password:'1234New@'
    });

    expect(user.firstName).toBe('New');
    expect(user.lastName).toBe('Name');
    expect(user.username).toBe('newtester');
    expect(user.email).toBe('newtester@gmail.com');
    expect(user.password).toBe('1234New@');
  });

  it('should require a product name and password', async () => {
    await expect(UserMock.create({})).rejects.toThrow();
  });
});