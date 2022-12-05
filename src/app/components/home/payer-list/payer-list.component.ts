import { Component, OnInit } from '@angular/core';
import { ModalType } from 'src/app/common/enums';
import { Payer } from 'src/app/common/models';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-payer-list',
  templateUrl: './payer-list.component.html',
  styleUrls: ['./payer-list.component.scss'],
})
export class PayerListComponent implements OnInit {
  listOfPayer: Payer[] = [
    {
      id: uuidv4(),
      name: 'ชานนท์',
    },
  ];

  get modalType(): typeof ModalType {
    return ModalType;
  }

  constructor() {}

  ngOnInit(): void {}

  openPayerListModal(type: ModalType, id?: string): void {}
}
