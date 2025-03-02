import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import User from "./user.js"; 

const JournalEntry = sequelize.define(
  "JournalEntry",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User, 
        key: "userId", 
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    mood: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Neutral",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "journal_entries", 
  }
);

User.hasMany(JournalEntry, { foreignKey: "userId" });
JournalEntry.belongsTo(User, { foreignKey: "userId" });

export default JournalEntry;
