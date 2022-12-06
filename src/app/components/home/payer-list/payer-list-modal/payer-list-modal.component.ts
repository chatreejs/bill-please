import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {
  markAllControlsAsDirty,
  ModalType,
  Payer,
  updateAllControlValueAndValidity,
} from 'src/app/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-payer-list-modal',
  templateUrl: './payer-list-modal.component.html',
  styleUrls: ['./payer-list-modal.component.scss'],
})
export class PayerListModalComponent implements OnInit {
  @Input() type?: ModalType;
  @Input() id?: string;

  payerListForm!: FormGroup;
  hasChildren: boolean = false;

  get modalType(): typeof ModalType {
    return ModalType;
  }

  get childrenForm(): FormArray {
    return this.payerListForm.get('childrenForm') as FormArray;
  }

  constructor(private modal: NzModalRef, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.payerListForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      hasChildren: [false],
      childrenForm: this.fb.array([]),
    });
    if (this.type === ModalType.Update) {
      this.initFormData();
    }
  }

  initFormData(): void {
    // Mock data
    // TODO: Use NgRx to get data from store
    const mockData: Payer = {
      id: uuidv4(),
      name: 'ชานนท์',
      children: [
        {
          id: uuidv4(),
          name: 'ลิง',
        },
      ],
    };
    this.payerListForm.patchValue({
      id: mockData.id,
      name: mockData.name,
      hasChildren: mockData.children.length > 0,
    });
    if (mockData.children.length > 0) {
      this.hasChildren = true;
      mockData.children.forEach((child) => {
        this.childrenForm.push(
          this.fb.group({
            id: [child.id],
            name: [child.name, Validators.required],
          }),
        );
      });
    }
  }

  childrenChange(value: boolean): void {
    this.hasChildren = value;
    if (value) {
      this.addChildrenForm();
    } else {
      this.childrenForm.clear();
    }
  }

  addChildrenForm(): void {
    this.childrenForm.push(
      this.fb.group({
        id: [null],
        name: ['', Validators.required],
      }),
    );
  }

  removeChildrenForm(index: number): void {
    this.childrenForm.removeAt(index);
  }

  savePayer(): void {
    if (this.payerListForm.valid) {
      if (this.type === ModalType.Create) {
        this.payerListForm.controls['id'].setValue(uuidv4());
        console.log('submit:: Create', this.payerListForm.value);
        this.modal.close();
      } else {
        console.log('submit:: Update', this.payerListForm.value);
        this.modal.close();
      }
    } else {
      markAllControlsAsDirty([this.payerListForm]);
      updateAllControlValueAndValidity([this.payerListForm]);
    }
  }

  deletePayer(): void {
    console.log('delete');
    this.modal.close();
  }

  destroyModal(): void {
    this.modal.destroy();
  }
}
