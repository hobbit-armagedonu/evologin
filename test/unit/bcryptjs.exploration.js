const { expect } = require('chai');
const bcrypt = require('bcryptjs');

describe('bcrypt', () => {
    it('generates a hash from password and matches it later', async () => {
        const pwd = 'OrkizM@j0rki';
        const hashedPwd = await bcrypt.hash(pwd, 3);
        const compareResult = await bcrypt.compare(pwd, hashedPwd);

        expect(compareResult).to.be.equal(true);
    });
});
