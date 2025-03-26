import { listToColumn } from "@universe/v1/libraries/helper";

const RoleColumnList = ["id", "name", "permissions", "createdAt", "updatedAt"] as const;

export const RoleColumn = 
  listToColumn<typeof RoleColumnList[number]>(RoleColumnList);

export default RoleColumn; 