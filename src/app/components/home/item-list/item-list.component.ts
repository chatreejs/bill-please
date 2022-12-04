import { Component, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalType } from 'src/app/common/enums';
import { BillItem } from 'src/app/common/enums/models';
import { v4 as uuidv4 } from 'uuid';
import { ItemListModalComponent } from './item-list-modal/item-list-modal.component';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
})
export class ItemListComponent {
  listOfBillItem: BillItem[] = [
    {
      id: uuidv4(),
      name: 'น้ำแข็ง',
      quantity: 2,
      price: 60,
    },
    {
      id: uuidv4(),
      name: 'ช้างทาวเวอร์',
      quantity: 3,
      price: 670,
    },
  ];

  get modalType(): typeof ModalType {
    return ModalType;
  }

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {}

  openItemListModal(type: ModalType, id?: string): void {
    this.modalService.create({
      nzTitle: type === ModalType.Create ? 'เพิ่มรายการใหม่' : 'แก้ไขรายการ',
      nzContent: ItemListModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        type: type,
        id: id,
      },
      nzFooter: [
        {
          label: 'ยกเลิก',
          onClick: (component) => {
            component?.destroyModal();
          },
        },
        {
          label: 'บันทึก',
          type: 'primary',
          onClick: (component) => {
            component?.saveItem();
          },
        },
      ],
    });
  }

  openItemListFromBillModal(): void {}
}
