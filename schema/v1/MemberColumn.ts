import { listToColumn } from "@universe/v1/libraries/helper";

const MemberColumnList = ["id", "userId", "communityId", "role", "createdAt", "updatedAt"] as const;

export const MemberColumn = 
  listToColumn<typeof MemberColumnList[number]>(MemberColumnList);

export default MemberColumn; 