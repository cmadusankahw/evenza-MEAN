import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import {Service, ServiceCategories, BusinessLocations, PaymentTypes } from '../service.model';

@Component({
  selector: 'app-search-services',
  templateUrl: './search-services.component.html',
  styleUrls: ['./search-services.component.scss']
})
export class SearchServicesComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

    services: Service[] = [
      {
        service_id: 'S-01',
        service_name: 'Dream Photography',
        business_id: 'B-01',
        business_name: 'Dream Business',
        description: `Creative Worth Photography Studio is a community based professional photography business given to quality portraiture and full wedding coverage. Creative Worth seeks to provide a service to individuals, couples, and families that emphasizes and enhances the quality of their relationships through photographic imaging.`,
        service_category: 'Photography',
        available_booking: true,
        available_appoints: true,
        open_days_as_business: true,
        rating: 3.5,
        no_of_ratings: 125,
        no_of_bookings: 4,
        no_of_appoints: 2,
        rate: 256.37,
        rate_type: '/Hr',
        payment_type: 'Pay on Meet',
        feature_img: './assets/images/services/1.jpg',
        image_01: './assets/images/merchant/nopic.png',
        image_02: './assets/images/merchant/nopic.png',
        image_03: './assets/images/merchant/nopic.png'
      },
    ];

    //filter-derived from main service list

    //filter-categories
    categories: ServiceCategories[] = [
      { id: '1', val:'Top Rated'},
      { id: '2', val: 'Photography' },
      { id: '3', val: 'Dressing' },
      { id: '4', val: 'Transport' },
    ];

    //filter-payment types
    paymentTypes: PaymentTypes[] = [
      { id: '1', val: 'Pay on Meet' },
      { id: '2', val: 'Visa' },
      { id: '3', val: 'PayHere' },
    ];

    //filter-business locations
    businessLocations: BusinessLocations[] = [
      {id: '1', val: 'Matara'},
      {id: '1', val: 'Galle'},
      {id: '1', val: 'Hambanthota'},
      {id: '1', val: 'Colombo'},
      {id: '1', val: 'Gampaaha'},
    ];


  //temp value for user ratings
  ratings = 0;

  //temp slider options
  priceStart = 0;
  priceEnd = 49999;

  //filter-drawe-state
  opened = false;

  //enable searching mode
  searching = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  asData() {
    if (this.services.length) {
      return true;
    } else {
      return false;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
  }

  searchServices() {
    this.searching = !this.searching;
  }


}
