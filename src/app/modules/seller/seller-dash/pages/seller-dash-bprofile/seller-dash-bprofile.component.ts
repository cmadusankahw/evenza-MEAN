import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-seller-dash-bprofile',
  templateUrl: './seller-dash-bprofile.component.html',
  styleUrls: ['./seller-dash-bprofile.component.scss']
})
export class SellerDashBprofileComponent implements OnInit {

  idverified = false;
  iscreated = true;
  isowner = true;

  constructor() { }

  ngOnInit() {
  }

}