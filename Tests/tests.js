import assert from 'assert';
import sequelize from '../database.js'; 
import User from '../models/users.js'; 
import app from '../index.js'; 
import supertest from 'supertest';

const request = supertest(app);

describe('/v1/user Integration Tests', function() {
  const testUser = {
    username: 'test@gmail.com',
    firstName: 'Kusumanth',
    lastName: 'Gali',
    password: 'Testing@123!'
  };

  before(async function() {
    try {
      await sequelize.sync({ force: true });
      console.log('Database synced.');
    } catch (error) {
    }
  });
  

  it('Test 1 - Creating & using the GET call to verify its existence.', async function() {
    // Create a user
    const resPost = await request.post('/v1/user').send(testUser);
    assert.strictEqual(resPost.status, 201, 'User creation failed');
    assert.strictEqual(resPost.body.username, testUser.username, 'Created username does not match');

    // Prepare the authentication header
    const authHeader = `Basic ${Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64')}`;

    // Validate the created account exists
    const resGet = await request.get('/v1/user/self').set('Authorization', authHeader);
    assert.strictEqual(resGet.status, 200, 'User retrieval failed');
    assert.strictEqual(resGet.body.username, testUser.username, 'Retrieved username does not match');
  });

  it('Test 2 - GET call to check updated account', async function() {
    // Prepare the authentication header again for this test
    const authHeader = `Basic ${Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64')}`;

    // Update user information
    const updatedInfo = { firstName: 'UpdatedFirstName' };
    const resUpdate = await request.put('/v1/user/self').set('Authorization', authHeader).send(updatedInfo);
    assert.strictEqual(resUpdate.status, 204, 'User update failed');

    // Validate the updated account information
    const resGet = await request.get('/v1/user/self').set('Authorization', authHeader);
    assert.strictEqual(resGet.status, 200, 'Updated user retrieval failed');
    assert.strictEqual(resGet.body.firstName, updatedInfo.firstName, 'FirstName not updated');
  });

  after(async () => {
    let cleanupSuccessful = true;
  
    // Attempt to delete the test user
    try {
      await User.destroy({ where: { username: testUser.username } });
      console.log('user deleted');
    } catch (error) {
      console.error('deleted test user:', error);
      cleanupSuccessful = false;
    }
  
    // Close the Sequelize connection if cleanup was successful
    if (cleanupSuccessful) {
      try {
        await sequelize.close();
        console.log('Sequelize connection closed successfully.');
      } catch (error) {
        console.error('Error closing Sequelize connection:', error);
      }
    } else {
      console.log('Skipped closing Sequelize connection due to previous cleanup errors.');
    }
  });
});
