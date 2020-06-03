import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Appointment } from '../eventplanner.model';

@Component({
  selector: 'app-planner-appoints',
  templateUrl: './planner-appoints.component.html',
  styleUrls: ['./planner-appoints.component.scss']
})
export class PlannerAppointsComponent implements OnInit {

  displayedColumns: string[] = ['id', 'service_name',  'appointed_date', 'appointed_time', 'state', 'action'];
  dataSource: MatTableDataSource<Appointment>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Create sample bookings
  appointments: Appointment[] ;

  // booking-states
  @Input() appointmentType = 'pending';

  // booking arrays
  recievedAppointments = [];


  constructor() { }

  ngOnInit() {
    if (this.appointments) {
      this.dataSource = new MatTableDataSource(this.addAppointments(this.appointments, this.appointmentType));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  addAppointments(appoints: Appointment[], state: string) {
    const pedingAppoints = [];
    for (const val of appoints) {
      if (val.state === state) {
        pedingAppoints.push(Object.assign({}, val));
      }
    }
    this.recievedAppointments = [...pedingAppoints];
    return this.recievedAppointments;
  }

  showAppointmentDetails(appointId: string) {
  }



}