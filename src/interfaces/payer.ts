export interface IPayer {
  id: string;
  name: string;
  children: IPayerChildren[];
}

export interface IPayerChildren {
  id: string;
  name: string;
}
