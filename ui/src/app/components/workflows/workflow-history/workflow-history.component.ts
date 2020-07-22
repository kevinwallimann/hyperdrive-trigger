import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {WorkflowHistoryModel} from "../../../models/workflowHistory.model";
import {Store} from "@ngrx/store";
import {AppState, selectWorkflowState} from "../../../stores/app.reducers";
import {ActivatedRoute} from "@angular/router";
import {LoadWorkflowHistory} from "../../../stores/workflows/workflows.actions";
import { absoluteRoutes } from 'src/app/constants/routes.constants';

@Component({
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.component.html',
  styleUrls: ['./workflow-history.component.scss']
})
export class WorkflowHistoryComponent implements OnInit {

  workflowsSubscription: Subscription = null;
  paramsSubscription: Subscription;

  absoluteRoutes = absoluteRoutes;

  loading = true;
  workflowHistory: WorkflowHistoryModel[] = [];
  selected: WorkflowHistoryModel[] = [];

  id: number;
  left: number = undefined;
  right: number= undefined;

  isSelectable(zzz): boolean {
    const leng = this.selected.length == 2;
    const cont = this.selected.some((xxx) => xxx === zzz);
    const result = leng && !cont;
    return !result;
  }

  selectionChanged(event) {
    console.log(this.selected);
  }

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      this.id = parameters.id;
      this.store.dispatch(new LoadWorkflowHistory(parameters.id));
    });
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.workflowAction.loading;
      this.workflowHistory = state.workflowHistory;
    });
  }

}
