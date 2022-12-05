import { Component, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalType } from 'src/app/common/enums';
import { BillItem } from 'src/app/common/models';
import { v4 as uuidv4 } from 'uuid';
import { ItemListModalComponent } from './item-list-modal/item-list-modal.component';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
})
export class ItemListComponent {
  isShowCheckbox: boolean = false;
  isAllChecked: boolean = false;
  isIndeterminate: boolean = false;
  listOfBillItem: readonly BillItem[] = [
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
  setOfCheckedId: Set<string> = new Set<string>();

  get modalType(): typeof ModalType {
    return ModalType;
  }

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {}

  toggleCheckbox(): void {
    this.isShowCheckbox = !this.isShowCheckbox;
    if (!this.isShowCheckbox) {
      this.setOfCheckedId.clear();
      this.refreshCheckedStatus();
    }
  }

  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    this.isAllChecked = this.listOfBillItem.every((item) =>
      this.setOfCheckedId.has(item.id),
    );
    this.isIndeterminate =
      this.listOfBillItem.some((item) => this.setOfCheckedId.has(item.id)) &&
      !this.isAllChecked;
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfBillItem.forEach((item) =>
      this.updateCheckedSet(item.id, checked),
    );
    this.refreshCheckedStatus();
  }

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
