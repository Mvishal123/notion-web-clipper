export interface ItemDataType {
  id: string;
  title: string;
  url: string;
  status?: "Done" | "In progress" | "Not started";
}
