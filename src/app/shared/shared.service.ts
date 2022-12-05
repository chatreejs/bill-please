import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor() {}

  markFormGroupAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      switch (formGroup.get(key)!.constructor.name) {
        case 'FormGroup':
          this.markFormGroupAsDirty(formGroup.get(key) as FormGroup);
          break;
        case 'FormArray':
          this.markFormArrayAsDirty(formGroup.get(key) as FormArray);
          break;
        case 'FormControl':
          this.markControlAsDirty(formGroup.get(key) as FormControl);
          break;
      }
    });
  }

  markFormArrayAsDirty(formArray: FormArray): void {
    formArray.controls.forEach((control) => {
      switch (control.constructor.name) {
        case 'FormControl':
          this.markControlAsDirty(control as FormControl);
          break;
        case 'FormArray':
          this.markFormArrayAsDirty(control as FormArray);
          break;
        case 'FormGroup':
          this.markFormGroupAsDirty(control as FormGroup);
          break;
      }
    });
  }

  markControlAsDirty(formControl: FormControl): void {
    formControl.markAsDirty();
    formControl.updateValueAndValidity();
  }
}
