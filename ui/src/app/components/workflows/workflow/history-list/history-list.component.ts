import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { InitializeWorkflows, LoadWorkflowHistory } from '../../../../stores/workflows/workflows.actions';
import { Subscription } from 'rxjs';
import { ProjectModel } from '../../../../models/project.model';
import { WorkflowHistoryModel } from '../../../../models/workflowHistory.model';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit {
  workflowsSubscription: Subscription = null;

  loading = true;
  workflowHistory: WorkflowHistoryModel[] = [];

  selectable: boolean = true;
  selected: any[] = [];

  selectionChanged(asd) {
    console.log('asd', asd);
    console.log('selected', this.selected);
  }

  constructor(private store: Store<AppState>) {
    this.store.dispatch(new LoadWorkflowHistory(239));
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.loading = state.workflowAction.loading;
      this.workflowHistory = state.workflowHistory;
    });
  }
}
