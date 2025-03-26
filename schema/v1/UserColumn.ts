import { listToColumn } from "@universe/v1/libraries/helper";

const UserColumnList = ["id", "email", "password", "name", "createdAt"] as const;

export const UserColumn = 
  listToColumn<typeof UserColumnList[number]>(UserColumnList);

export default UserColumn; 