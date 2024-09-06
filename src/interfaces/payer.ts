export interface IPayer {
  id: string;
  name: string;
  friend?: IPayerChildren[];
}

export interface IPayerChildren {
  id: string;
  name: string;
}

export interface IPayerForm {
  name: string;
  friend: IPayerChildren[];
}
