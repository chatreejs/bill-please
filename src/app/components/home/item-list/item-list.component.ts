import { Component, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
    {
      id: uuidv4(),
      name: 'ส่วนลด VIP',
      quantity: 1,
      price: -100,
    },
  ];
  setOfCheckedId: Set<string> = new Set<string>();

  get modalType(): typeof ModalType {
    return ModalType;
  }

  constructor(
    private modalService: NzModalService,
    private translate: TranslateService,
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

  deleteItemList(): void {
    console.log(this.setOfCheckedId);
    this.toggleCheckbox();
  }

  openItemListModal(type: ModalType, id?: string): void {
    this.modalService.create({
      nzTitle: this.translate.instant(
        type === ModalType.Create
          ? 'home.itemList.modal.title.add'
          : 'home.itemList.modal.title.edit',
      ),
      nzContent: ItemListModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        type,
        id,
      },
      nzFooter: [
        {
          label: this.translate.instant('common.button.cancel'),
          onClick: (component) => {
            component?.destroyModal();
          },
        },
        {
          label: this.translate.instant('common.button.save'),
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
