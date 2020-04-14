import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router, Event, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.scss']
})
export class SellerDashboardComponent implements OnInit {

  showSubMenu = false;
  home = true;
  bProfile;
  orders;
  inventory;
  report;
  profile;

    //create new product
    editmode = true;
    addnew = true;

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private router: Router) { }

  ngOnInit() {
    this.routerEvents();
  }

  routerEvents() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        if (e.url === '/sel/dash') {
          this.onHome();
        } else if (e.url === '/sel/dash/bprofile') {
          this.onBprofile();
        } else if (e.url === '/sel/dash/orders') {
          this.onOrders();
        } else if (e.url === '/sel/dash/inventory') {
          this.onInventory();
        } else if (e.url === '/sel/dash/reports') {
          this.onReport();
        } else if (e.url === '/sel/dash/profile') {
          this.onProfile();
        }
      }
    });
  }


  onHome() {
    this.home = true;
    this.bProfile = false;
    this.orders = false;
    this.inventory = false;
    this.report = false;
    this.profile = false;

  }


  onBprofile() {
    this.home = false;
    this.bProfile = true;
    this.orders = false;
    this.inventory = false;
    this.report = false;
    this.profile = false;

  }


  onOrders() {
    this.home = false;
    this.bProfile = false;
    this.orders = true;
    this.inventory = false;
    this.report = false;
    this.profile = false;

  }


  onInventory() {
    this.home = false;
    this.bProfile = false;
    this.orders = false;
    this.inventory = true;
    this.report = false;
    this.profile = false;

  }


  onReport() {
    this.home = false;
    this.bProfile = false;
    this.orders = false;
    this.inventory = false;
    this.report = true;
    this.profile = false;

  }


  onProfile() {
    this.home = false;
    this.bProfile = false;
    this.orders = false;
    this.inventory = false;
    this.report = false;
    this.profile = true;

  }

}