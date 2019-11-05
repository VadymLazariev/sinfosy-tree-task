export default interface OrgTreeNode {
  id: number;
  title: string;
  parent?: number;
  children?: any[];
}
