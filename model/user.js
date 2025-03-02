import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";


const User=sequelize.define("User",{
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password:{
        type:DataTypes.STRING,
        allowNull: false,
      }
});

User.associate = (models) => {
  User.hasMany(models.JournalEntry, { foreignKey: "userId" });
};

export default User;