const wulkanowy = require('../index');
const client = new wulkanowy.Client('fakelog.cf');

test('Login to fakelog account', () => {
  expect.assertions(1);
  return expect(client.login('jan@fakelog.cf','jan123')).resolves.toEqual('powiatwulkanowy');
});
