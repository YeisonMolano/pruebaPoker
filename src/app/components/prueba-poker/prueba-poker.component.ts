import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Table } from '../../modells/table';
import { Poker } from 'src/app/modells/poker';
import { Result } from 'src/app/modells/result';
import { MessageService } from 'primeng/api';
import { Validation } from 'src/app/modells/validation';
import { CalculatorService } from 'src/app/service/calculator.service';
import { log } from 'mathjs';

@Component({
  selector: 'app-prueba-poker',
  templateUrl: './prueba-poker.component.html',
  styleUrls: ['./prueba-poker.component.css'],
})
export class PruebaPokerComponent {
  numbers: Array<Table>;
  poker: Array<Poker>;
  total: Array<Result>;
  formTable: FormGroup;
  visible: Boolean;
  categories: { name: string; percentage: number }[] = [];
  modalTwo = false;
  items: {acceptanceLevel: number}[] = [];
  selectedAcceptance : {acceptanceLevel: number}
  errorPercentage : any;
  chiInv: number
  result : any;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private calculator : CalculatorService
  ) {
    this.numbers = new Array<Table>();
    this.poker = new Array<Poker>();
    this.total = new Array<Result>();
    this.visible = false;
    this.chiInv = 0;
    this.categories = [
      { name: 'Todos diferentes a (TD)', percentage: 0.504 },
      { name: '1P', percentage: 0.432 },
      { name: '2P', percentage: 0.027 },
      { name: 'Trio (T)', percentage: 0.036 },
      { name: 'Poker (P)', percentage: 0.001 },
    ];
    this.items = [
      {acceptanceLevel : 80},
      {acceptanceLevel : 90},
      {acceptanceLevel : 95},
      {acceptanceLevel : 98},
      {acceptanceLevel : 99}
    ]
    this.selectedAcceptance = this.items[0];
    this.errorPercentage = 100 - this.selectedAcceptance.acceptanceLevel;
    this.formTable = this.formBuilder.group({
      amount: new FormControl('', Validators.required),
      x0: new FormControl('', Validators.required),
      x1: new FormControl('', Validators.required),
    });
  }

  generateTable() {
    if (this.formTable.valid) {
      this.numbers = [];
      //Generación de la primera fila de la tabla
      let xoFinal = this.formTable.get('x0')?.value;
      let x1Final = this.formTable.get('x1')?.value;
      let yFinal = xoFinal * x1Final;
      let extensionFinal = yFinal.toString().length;
      let centerFinal;
      if (extensionFinal === 8) {
        centerFinal = yFinal.toString().substr(2, 4);
      } else {
        centerFinal = yFinal.toString().substr(1, 4);
      }
      let riFinal = parseInt(centerFinal) / 10000;
      let number = new Table();
      number.center = parseInt(centerFinal);
      number.extension = extensionFinal;
      number.n = 1;
      number.ri = riFinal;
      number.x0 = xoFinal;
      number.x1 = x1Final;
      number.y = yFinal;
      this.numbers.push(number);
    
      //Generación de los demas numeros según la cantidad establecida por el usuario.
      for (
        let index = 1;
        index < this.formTable.get('amount')?.value;
        index++
      ) {
        xoFinal = x1Final;
        x1Final = centerFinal;
        yFinal = xoFinal * x1Final;
        extensionFinal = yFinal.toString().length;
        centerFinal;
        if (extensionFinal === 8) {
          centerFinal = yFinal.toString().substr(2, 4);
        } else {
          centerFinal = yFinal.toString().substr(1, 4);
        }
        riFinal = parseInt(centerFinal) / 10000;

        let newNumber = new Table();
        newNumber.n = index + 1;
        newNumber.center = centerFinal;
        newNumber.extension = extensionFinal;
        newNumber.ri = riFinal;
        newNumber.x0 = xoFinal;
        newNumber.x1 = x1Final;
        newNumber.y = yFinal;
        this.numbers.push(newNumber);
        if (riFinal == 0) {
          this.formTable.get('x0')?.reset();
          this.formTable.get('x1')?.reset();
          this.formTable.get('amount')?.reset();
          break;
        }
      }
      this.formTable.get('x0')?.reset();
      this.formTable.get('x1')?.reset();
      this.formTable.get('amount')?.reset();
    } else {
      this.showMessage('Debe digitar todos los campos');
    }
  }

  generatePoker() {
    for (let index = 0; index < this.numbers.length; index++) {
      let poker = new Poker();
      poker.ri = this.numbers[index].ri;
      poker.categoria = this.generateResult(
        this.numbers[index].center!.toString()
      );
      this.poker.push(poker);
    }
  }

  generateResult(number: string): string {
    const digitos = number.split('');
    const conteoDígitosIguales: { [key: string]: number } = {};
    let count = 0;
    let response = '';

    digitos.forEach((dígito) => {
      if (conteoDígitosIguales[dígito]) {
        conteoDígitosIguales[dígito]++;
      } else {
        conteoDígitosIguales[dígito] = 1;
      }
    });
    for (const dígito in conteoDígitosIguales) {
      if (conteoDígitosIguales[dígito] > 1) {
        response = `${conteoDígitosIguales[dígito]} veces.`;
        count++;
      }
    }
    if (Object.keys(conteoDígitosIguales).length == 4) {
      response = 'Todos diferentes a (TD)';
    }
    if (count == 2) {
      response = '2P';
    }
    if (response == '2 veces.' && count == 1) {
      response = '1P';
    }
    if (response == '3 veces.') {
      response = 'Trio (T)';
    }
    if (response == '4 veces.') {
      response = 'Poker (P)';
    }
    return response;
  }

  generateResultGeneral() {
    let amount = 0;
    let amountOne = 0;
    let amountTwo = 0;
    for (let index = 0; index < this.categories.length; index++) {
      let result = new Result();
      result.cat = this.categories[index].name;
      result.frecObs = this.getAmount(this.categories[index].name);
      amount += this.getAmount(this.categories[index].name);
      result.frecEsp = this.categories[index].percentage * this.poker.length;
      amountOne += this.categories[index].percentage * this.poker.length;
      result.elevated =
        ((result.frecEsp - result.frecObs) *
          (result.frecEsp - result.frecObs)) /
        result.frecEsp;
      amountTwo +=
        ((result.frecEsp - result.frecObs) *
          (result.frecEsp - result.frecObs)) /
        result.frecEsp;
      this.total.push(result);
    }
    let result = new Result();
    result.cat = 'Sumatoria';
    result.frecObs = amount;
    result.frecEsp = amountOne;
    result.elevated = amountTwo;
    this.total.push(result);
    this.doVisible();
  }

  getAmount(categoria: string): number {
    let amount = 0;
    this.poker.forEach((element) => {
      if (element.categoria == categoria) {
        amount++;
      }
    });
    return amount;
  }

  doVisible() {
    this.visible = !this.visible;
  }

  reset() {
    this.modalTwo = false;
    this.numbers = new Array<Table>();
    this.poker = new Array<Poker>();
    this.total = new Array<Result>();
    this.visible = false;
    this.formTable.reset();
    this.selectedAcceptance = this.items[0];
  }

  showMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Datos incorrectos',
      detail: message,
    });
  }

  activeSecondModal(){
    this.onModelChange();
    this.modalTwo = !this.modalTwo;
    this.onModelChange();
  }

  onModelChange(){
    this.errorPercentage = 100 - this.selectedAcceptance.acceptanceLevel;
    this.calculator.getChiInv(4, this.selectedAcceptance.acceptanceLevel / 100).subscribe(res => {
      this.chiInv = res
    })
    this.viewSolution();
  }

  viewSolution(){
    if(this.total[this.total.length - 1].elevated > this.chiInv){
      this.result = 'El estadistico (X^2)o=' + this.total[this.total.length - 1].elevated + ' es mayor que el estadistico correspondiente de la chi-cuadrada (X^2)(' + this.errorPercentage / 100 + ';4)= ' + this.chiInv + '. En consecuencia, se Rechaza que los numeros  del conjunto ri son independientes.';
    }else if(this.total[this.total.length - 1].elevated < this.chiInv){
      this.result = 'El estadistico (X^2)o=' + this.total[this.total.length - 1].elevated + '  no es mayor que el estadistico correspondiente de la chi-cuadrada (X^2)(' + this.errorPercentage / 100 + ';4)= ' + this.chiInv + '. En consecuencia, los numeros  del conjunto ri son independientes.';
    }    
  }
}
