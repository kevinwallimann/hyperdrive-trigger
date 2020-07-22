/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.persistance

import java.time.LocalDateTime

import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.{Create, DBOperation, Delete, Update}
import za.co.absa.hyperdrive.trigger.models._

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowHistoryRepository extends Repository {
  import slick.dbio.DBIO

  private[persistance] def create(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int]
  private[persistance] def update(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int]
  private[persistance] def delete(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int]

  def getWorkflowHistory(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getWorkflowsForComparison(leftHistoryId: Long, rightHistoryId: Long)(implicit ec: ExecutionContext): Future[WorkflowHistoriesForComparison]
}

@stereotype.Repository
class WorkflowHistoryRepositoryImpl extends WorkflowHistoryRepository {
  import profile.api._

  private def insert(workflow: WorkflowJoined, user: String, operation: DBOperation)(implicit ec: ExecutionContext): DBIO[Int] = {
    val workflowHistory = WorkflowHistory(
      history = History(
        changedOn = LocalDateTime.now(),
        changedBy = user,
        operation = operation
      ),
      workflowId = workflow.id,
      workflow = workflow
    )
    workflowHistoryTable += workflowHistory
  }

  override private[persistance] def create(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(workflow, user, Create)
  }

  override private[persistance] def update(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(workflow, user, Update)
  }

  override private[persistance] def delete(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(workflow, user, Delete)
  }

  override def getWorkflowHistory(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[History]] = {
    db.run(
      workflowHistoryTable.filter(_.workflowId === workflowId).map(
        row => (row.id, row.changedOn, row.changedBy, row.operation)
      ).result
    ).map(_.map(result => History(
      id = result._1,
      changedOn = result._2,
      changedBy = result._3,
      operation = result._4
    )))
  }

  override def getWorkflowsForComparison(leftHistoryId: Long, rightHistoryId: Long)(implicit ec: ExecutionContext): Future[WorkflowHistoriesForComparison] = {
    val queryResult = db.run(
      (for {
        leftWorkflowHistory <- workflowHistoryTable if leftWorkflowHistory.id === leftHistoryId
        rightWorkflowHistory <- workflowHistoryTable if rightWorkflowHistory.id === rightHistoryId
      } yield {
        (leftWorkflowHistory, rightWorkflowHistory)
      }).result
    )

    queryResult.map(
      _.headOption.map{ workflowsForComparisonTouple =>
        WorkflowHistoriesForComparison(workflowsForComparisonTouple._1, workflowsForComparisonTouple._2)
      }.getOrElse(
        throw new Exception(s"Workflow history with ${leftHistoryId} or ${rightHistoryId} does not exist.")
      )
    )
  }

}