import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalType } from 'src/app/common/enums';
import { Payer } from 'src/app/common/models';
import { v4 as uuidv4 } from 'uuid';
import { PayerListModalComponent } from './payer-list-modal/payer-list-modal.component';
@Component({
  selector: 'app-payer-list',
  templateUrl: './payer-list.component.html',
  styleUrls: ['./payer-list.component.scss'],
})
export class PayerListComponent implements OnInit {
  isShowCheckbox: boolean = false;
  isAllChecked: boolean = false;
  isIndeterminate: boolean = false;
  listOfPayer: Payer[] = [
    {
      id: uuidv4(),
      name: 'ชานนท์',
      children: [
        {
          id: uuidv4(),
          name: 'อุ้ย',
        },
        {
          id: uuidv4(),
          name: 'เค',
        },
      ],
    },
    {
      id: uuidv4(),
      name: 'ต้นตุง',
      children: [],
    },
  ];
  setOfCheckedId: Set<string> = new Set<string>();
  expandSet = new Set<string>();

  get modalType(): typeof ModalType {
    return ModalType;
  }

  constructor(
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit(): void {}

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
    this.isAllChecked = this.listOfPayer.every((item) =>
      this.setOfCheckedId.has(item.id),
    );
    this.isIndeterminate =
      this.listOfPayer.some((item) => this.setOfCheckedId.has(item.id)) &&
      !this.isAllChecked;
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfPayer.forEach((item) => this.updateCheckedSet(item.id, checked));
    this.refreshCheckedStatus();
  }

  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  deleteItemList(): void {
    console.log(this.setOfCheckedId);
    this.toggleCheckbox();
  }

  openPayerListModal(type: ModalType, id?: string): void {
    this.modalService.create({
      nzTitle: type === ModalType.Create ? 'เพิ่มคนจ่าย' : 'แก้ไขคนจ่าย',
      nzContent: PayerListModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        type,
        id,
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
            component?.savePayer();
          },
        },
      ],
    });
  }
}
