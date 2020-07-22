import { Component, OnInit } from '@angular/core';
import {PartValidation, PartValidationFactory} from "../../../../../models/workflowFormParts.model";
import {Subject} from "rxjs";
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss']
})
export class HistoryDetailComponent implements OnInit {

  isHistoryDetailHidden = false;
  partValidation: PartValidation = PartValidationFactory.create(true, 1000, 1)
  detailsChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleHistoryDetailAccordion() {
    this.isHistoryDetailHidden = !this.isHistoryDetailHidden;
  }

}
