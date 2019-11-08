export default interface OrgTreeNode {
  id: number;
  type?: any;
  title: string;
  parent?: number;
  children?: OrgTreeNode[];
  expanded?: boolean;
}
