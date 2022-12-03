import { Component } from '@angular/core';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
})
export class ExpenseComponent {
  expenseList = [
    {
      payer: 'Chanon',
      total: 100.25,
      items: [
        {
          name: 'Milk',
          quantity: 1,
          price: 10.25,
        },
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'อุ้ย',
      total: 290,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'ชานนท์',
      total: 320,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'อุ้ย',
      total: 290,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'ชานนท์',
      total: 320,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'อุ้ย',
      total: 290,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'ชานนท์',
      total: 320,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'อุ้ย',
      total: 290,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
    {
      payer: 'ลิง',
      total: 320,
      items: [
        {
          name: 'Bread',
          quantity: 2,
          price: 90,
        },
      ],
    },
  ];
}
