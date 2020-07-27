import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {HistoryModel, WorkflowHistoriesForComparisonModel} from "../../models/historyModel";
import {api} from "../../constants/api.constants";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class WorkflowHistoryService {

  constructor(private httpClient: HttpClient) {}

  getHistoryForWorkflow(workflowId: number): Observable<HistoryModel[]> {
    const params = new HttpParams().set('workflowId', workflowId.toString());

    return this.httpClient
      .get<HistoryModel[]>(api.GET_HISTORY_FOR_WORKFLOW, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

  getWorkflowsFromHistory(leftWorkflowHistoryId: number, rightWorkflowHistoryId: number): Observable<WorkflowHistoriesForComparisonModel> {
    const params = new HttpParams()
      .set('leftWorkflowHistoryId', leftWorkflowHistoryId.toString())
      .set('rightWorkflowHistoryId', rightWorkflowHistoryId.toString());

    return this.httpClient
      .get<WorkflowHistoriesForComparisonModel>(api.GET_WORKFLOWS_FROM_HISTORY, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }

}
