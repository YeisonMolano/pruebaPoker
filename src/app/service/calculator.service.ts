import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  urlGlobal = 'http://localhost:8080/get/chi'

  constructor(private http: HttpClient) { }

  getChiInv(ditit: number, amount: number){
    return this.http.get<any>(this.urlGlobal + '/' + ditit + '/' + amount);
  }
}
