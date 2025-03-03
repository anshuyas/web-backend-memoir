const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const JournalMock = dbMock.define('JournalEntry', {
    id:1,
    userId: 2,
    title: 'Testing',
    content:'I am test journal',
    date: '2025-03-03',
    mood: 'happy',
    createdAt:"2025-03-01",
    updatedAt:"2025-03-01",
    timestamps:"2025-03-01"
  });

describe('Journal Model', () => {
    it('should create a journal', async () => {
      const journal = await JournalMock.create({
    id:2,
    userId: 3,
    title: 'Checking',
    content:'I am check journal',
    date: '2025-03-01',
    mood: 'happy',
    createdAt:"2025-03-02",
    updatedAt:"2025-03-02",
    timestamps:"2025-03-02"
 });

 expect(journal.id).toBe(2);
 expect(journal.userId).toBe(3);
 expect(journal.title).toBe('Checking');
 expect(journal.content).toBe('I am check journal');
 expect(journal.date).toBe('2025-03-01');
 expect(journal.mood).toBe('happy');
 expect(journal.createdAt).toBe('2025-03-02');
 expect(journal.updatedAt).toBe('2025-03-02');
 expect(journal.timestamps).toBe('2025-03-02');
});

it('should require a userId and title', async () => {
    await expect(JournalMock.create({})).rejects.toThrow();
  });
});