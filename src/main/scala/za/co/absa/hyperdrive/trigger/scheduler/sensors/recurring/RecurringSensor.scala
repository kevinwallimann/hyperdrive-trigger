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

package za.co.absa.hyperdrive.trigger.scheduler.sensors.recurring

import java.time.format.DateTimeFormatter
import java.time.Instant

import org.slf4j.LoggerFactory
import play.api.libs.json.JsObject
import za.co.absa.hyperdrive.trigger.models.{Event, Properties, Sensor}
import za.co.absa.hyperdrive.trigger.persistance.DagInstanceRepository
import za.co.absa.hyperdrive.trigger.scheduler.sensors.PollSensor

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class RecurringSensor(
  eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
  sensorDefinition: Sensor,
  executionContext: ExecutionContext,
  dagInstanceRepository: DagInstanceRepository
) extends PollSensor(eventsProcessor, sensorDefinition, executionContext) {

  private val properties = sensorDefinition.properties
  private val eventDateFormatter: DateTimeFormatter = DateTimeFormatter.ISO_INSTANT

  private val logger = LoggerFactory.getLogger(this.getClass)
  private val logMsgPrefix = s"Sensor id = ${properties.sensorId}."

  override def poll(): Future[Unit] = {
    logger.debug(s"$logMsgPrefix. Polling new events.")

    val fut = dagInstanceRepository.hasRunningDagInstance(sensorDefinition.workflowId).flatMap { hasRunningDagInstance =>
      if (hasRunningDagInstance) {
        logger.debug(s"$logMsgPrefix. Workflow is running.")
        Future.successful((): Unit)
      } else {
        val sourceEventId = s"sid=${properties.sensorId};t=${eventDateFormatter.format(Instant.now())}"
        val event = Event(sourceEventId, properties.sensorId, JsObject.empty)
        eventsProcessor.apply(Seq(event), properties).map(_ => (): Unit)
      }
    }

    fut.onComplete {
      case Success(_) => logger.debug(s"$logMsgPrefix. Polling successful")
      case Failure(exception) => {
        logger.debug(s"$logMsgPrefix. Polling failed.", exception)
      }
    }
    fut
  }

  override def closeInternal(): Unit = {}
}
