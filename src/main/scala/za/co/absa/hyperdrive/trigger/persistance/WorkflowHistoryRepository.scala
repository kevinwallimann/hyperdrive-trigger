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

import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.{Create, DBOperation, Delete, Update}
import za.co.absa.hyperdrive.trigger.models._

import scala.concurrent.{ExecutionContext, Future}

trait WorkflowHistoryRepository extends Repository {
  import slick.dbio.DBIO

  def create(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int]
  def update(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int]
  def delete(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int]

  def getWorkflowHistory(id: Long)(implicit ec: ExecutionContext): Future[Seq[History]]
  def getWorkflowsForComparison(left: Long, right: Long)(implicit ec: ExecutionContext): Future[WorkflowsForComparison]
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

  override def create(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(workflow, user, Create)
  }

  override def update(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(workflow, user, Update)
  }

  override def delete(workflow: WorkflowJoined, user: String)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(workflow, user, Delete)
  }

  override def getWorkflowHistory(id: Long)(implicit ec: ExecutionContext): Future[Seq[History]] = {
    db.run(
      workflowHistoryTable.filter(_.workflowId === id).map(row => (row.id, row.changedOn, row.changedBy, row.operation)).result
    ).map(_.map(result => History(
      id = result._1,
      changedOn = result._2,
      changedBy = result._3,
      operation = result._4
    )))
  }

  override def getWorkflowsForComparison(leftId: Long, rightId: Long)(implicit ec: ExecutionContext): Future[WorkflowsForComparison] = {
    val xxx = db.run(
      (for {
        left <- workflowHistoryTable if left.id === leftId
        right <- workflowHistoryTable if right.id === rightId
      } yield {
        (left, right)
    }).result
    )

    xxx.map(zzz=> zzz.headOption.map(qqq => WorkflowsForComparison(qqq._1.workflow, qqq._2.workflow)).getOrElse(throw new Exception(s"History with ${leftId} or ${rightId} does not exist.")))
  }

}
