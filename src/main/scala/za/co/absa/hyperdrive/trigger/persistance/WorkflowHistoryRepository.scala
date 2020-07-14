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
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.{Create, Delete, Update}
import za.co.absa.hyperdrive.trigger.models._

import scala.concurrent.ExecutionContext

trait WorkflowHistoryRepository extends Repository {
  import slick.dbio.DBIO

  def create(workflow: WorkflowJoined)(implicit ec: ExecutionContext): DBIO[Int]
  def update(workflow: WorkflowJoined)(implicit ec: ExecutionContext): DBIO[Int]
  def delete(workflow: WorkflowJoined)(implicit ec: ExecutionContext): DBIO[Int]
}

@stereotype.Repository
class WorkflowHistoryRepositoryImpl extends WorkflowHistoryRepository {
  import profile.api._
  private val logger = LoggerFactory.getLogger(this.getClass)
  private lazy val auth = SecurityContextHolder.getContext.getAuthentication
  private lazy val principal = auth.getPrincipal.asInstanceOf[UserDetails]

  private def insert(workflowHistory: WorkflowHistory)(implicit ec: ExecutionContext): DBIO[Int] = {

    println(SecurityContextHolder.getContext)
    println(SecurityContextHolder.getContext.getAuthentication.getPrincipal)
    workflowHistoryTable += workflowHistory
  }

  override def create(workflow: WorkflowJoined)(implicit ec: ExecutionContext): DBIO[Int] = {

    this.insert(
      WorkflowHistory(
        changedOn = LocalDateTime.now(),
        changedBy = "principal.getUsername",
        operation = Create,
        workflowId = workflow.id,
        workflow = workflow
      )
    )
  }

  override def update(workflow: WorkflowJoined)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(
      WorkflowHistory(
        changedOn = LocalDateTime.now(),
        changedBy = "principal.getUsername",
        operation = Update,
        workflowId = workflow.id,
        workflow = workflow
      )
    )
  }

  override def delete(workflow: WorkflowJoined)(implicit ec: ExecutionContext): DBIO[Int] = {
    this.insert(
      WorkflowHistory(
        changedOn = LocalDateTime.now(),
        changedBy = "principal.getUsername",
        operation = Delete,
        workflowId = workflow.id,
        workflow = workflow
      )
    )
  }

}
