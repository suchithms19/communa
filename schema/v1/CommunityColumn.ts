import { listToColumn } from "@universe/v1/libraries/helper";

const CommunityColumnList = ["id", "name", "slug", "createdAt", "updatedAt"] as const;

export const CommunityColumn = 
  listToColumn<typeof CommunityColumnList[number]>(CommunityColumnList);

export default CommunityColumn; 