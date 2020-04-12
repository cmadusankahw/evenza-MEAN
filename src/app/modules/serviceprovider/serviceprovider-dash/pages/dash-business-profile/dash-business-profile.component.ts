import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dash-business-profile',
  templateUrl: './dash-business-profile.component.html',
  styleUrls: ['./dash-business-profile.component.scss']
})
export class DashBusinessProfileComponent implements OnInit {

  iscreated = true;
  isowner = true;
  idverified = false;

  constructor() { }

  ngOnInit() {
  }

}
