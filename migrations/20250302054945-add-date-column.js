export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("journal_entries", "date", {
      type: Sequelize.DATEONLY,
      allowNull: true, // Set to true initially to avoid issues
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("journal_entries", "date");
  },
};
