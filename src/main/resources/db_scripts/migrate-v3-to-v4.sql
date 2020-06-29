/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");;
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

-- 1. Support for multiple transformers #82 https://github.com/AbsaOSS/hyperdrive/issues/82
-- 1.1 Update ColumnSelectorStreamTransformer component
update job_definition set maps = replace(maps,
'"component.transformer=za.co.absa.hyperdrive.ingestor.implementation.transformer.column.selection.ColumnSelectorStreamTransformer"',
'"component.transformer.id.1=column.selector", "component.transformer.class.column.selector=za.co.absa.hyperdrive.ingestor.implementation.transformer.column.selection.ColumnSelectorStreamTransformer"'
);

-- 1.2 Update ColumnSelectorStreamTransformer properties
update job_definition set maps = replace(maps,
'transformer.columns.to.select=',
'transformer.column.selector.columns.to.select='
);

-- 1.3 Update HyperConformance component
update job_definition set maps = replace(maps,
'"component.transformer=za.co.absa.enceladus.conformance.HyperConformance"',
'"component.transformer.id.1=hyperconformance","component.transformer.class.hyperconformance=za.co.absa.enceladus.conformance.HyperConformance"'
);

-- 2. Express ConfluentAvroKafkaDecoder as transformer #128 https://github.com/AbsaOSS/hyperdrive/issues/128
-- 2.1 Update ConfluentAvroKafkaDecoder component
update job_definition set maps = replace(maps,
'"component.decoder=za.co.absa.hyperdrive.ingestor.implementation.decoder.avro.confluent.ConfluentAvroKafkaStreamDecoder"',
'"component.transformer.id.0=confluent.avro.decoder", "component.transformer.class.confluent.avro.decoder=za.co.absa.hyperdrive.ingestor.implementation.transformer.avro.ConfluentAvroDecoderTransformer"'
);

-- 2.2 Update ConfluentAvroKafkaDecoder properties
update job_definition set maps = replace(maps,
'decoder.avro',
'transformer.confluent.avro.decoder'
);

-- 3. Refactor ParquetPartitioningStreamWriter to transformer #118 https://github.com/AbsaOSS/hyperdrive/issues/118
-- 3.3 Add partition columns to ParquetStreamWriter properties
-- Make sure writer.parquet.partition.columns are not set if ParquetPartitioningStreamWriter is used!
update job_definition set maps = replace(maps,
'"writer.parquet.destination.directory',
'"transformer.add.date.version.destination.directory=${writer.parquet.destination.directory}", "writer.parquet.partition.columns=hyperdrive_date, hyperdrive_version", "writer.parquet.destination'
) where maps like '%ParquetPartitioningStreamWriter%';

-- 3.1 Update ParquetPartitioningStreamWriter component
update job_definition set maps = replace(maps,
'"component.writer=za.co.absa.hyperdrive.ingestor.implementation.writer.parquet.ParquetPartitioningStreamWriter"',
'"component.transformer.id.2=add.date.version", "component.transformer.class.add.date.version=za.co.absa.hyperdrive.ingestor.implementation.transformer.add.dateversion.AddDateVersionTransformer", "component.writer=za.co.absa.hyperdrive.ingestor.implementation.writer.parquet.ParquetStreamWriter"'
);

-- 3.2 Update ParquetPartitioningStreamWriter properties
update job_definition set maps = replace(maps,
'writer.parquet.partitioning.report.date',
'transformer.add.date.version.report.date'
);

-- 4. Extract encoding part of KafkaStreamWriter to transformer component #129 https://github.com/AbsaOSS/hyperdrive/issues/129
-- 4.1 Update KafkaStreamWriter component
update job_definition set maps = replace(maps,
'"component.writer=za.co.absa.hyperdrive.ingestor.implementation.writer.kafka.KafkaStreamWriter"',
'"component.transformer.id.2=confluent.avro.encoder", "component.transformer.class.confluent.avro.encoder=za.co.absa.hyperdrive.ingestor.implementation.transformer.avro.ConfluentAvroEncoderTransformer", "component.writer=za.co.absa.hyperdrive.ingestor.implementation.writer.kafka.KafkaStreamWriter"'
);

-- 4.2 Update KafkaStreamWriter properties
update job_definition set maps = replace(maps,
'writer.kafka.schema',
'transformer.confluent.avro.encoder.schema'
);
update job_definition set maps = replace(maps,
'writer.kafka.value',
'transformer.confluent.avro.encoder.value'
);
update job_definition set maps = replace(maps,
'writer.kafka.produce.keys',
'transformer.confluent.avro.encoder.produce.keys'
);
update job_definition set maps = replace(maps,
'writer.kafka.key',
'transformer.confluent.avro.encoder.key'
);
update job_definition set maps = replace(maps,
'writer.kafka.option',
'transformer.confluent.avro.encoder.option'
);

-- 5. Move CheckpointOffsetManager logic to Reader and Writer #130 https://github.com/AbsaOSS/hyperdrive/issues/130
update job_definition set maps = replace(maps,
'manager.checkpoint.base.location',
'writer.common.checkpoint.location'
);

update job_definition set maps = replace(maps,
'"component.manager=za.co.absa.hyperdrive.ingestor.implementation.manager.checkpoint.CheckpointOffsetManager",',
''
);
