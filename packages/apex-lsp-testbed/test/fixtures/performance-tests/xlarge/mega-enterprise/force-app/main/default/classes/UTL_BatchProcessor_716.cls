public class UTL_BatchProcessor_716 implements Database.Batchable<SObject>, Database.Stateful, Database.AllowsCallouts, Schedulable {

    public class BatchConfig {
        public String query { get; set; }
        public Integer scopeSize { get; set; }
        public Boolean sendNotification { get; set; }
        public Map<String, String> parameters { get; set; }
        public List<String> recipientIds { get; set; }

        public BatchConfig(String query) {
            this.query = query;
            this.scopeSize = 200;
            this.sendNotification = false;
            this.parameters = new Map<String, String>();
            this.recipientIds = new List<String>();
        }

        public BatchConfig withScope(Integer size) {
            this.scopeSize = size;
            return this;
        }

        public BatchConfig withNotification(List<String> recipients) {
            this.sendNotification = true;
            this.recipientIds = recipients;
            return this;
        }

        public BatchConfig withParam(String key, String value) {
            this.parameters.put(key, value);
            return this;
        }
    }

    public class BatchMetrics {
        public Integer totalProcessed { get; set; }
        public Integer totalErrors { get; set; }
        public Integer totalBatches { get; set; }
        public Map<String, Integer> errorsByType { get; set; }
        public List<String> errorDetails { get; set; }
        public Long startTimeMs { get; set; }
        public Long endTimeMs { get; set; }

        public BatchMetrics() {
            this.totalProcessed = 0;
            this.totalErrors = 0;
            this.totalBatches = 0;
            this.errorsByType = new Map<String, Integer>();
            this.errorDetails = new List<String>();
            this.startTimeMs = System.currentTimeMillis();
        }

        public Decimal getDurationMinutes() {
            Long endMs = this.endTimeMs != null ? this.endTimeMs : System.currentTimeMillis();
            return Decimal.valueOf(endMs - this.startTimeMs) / 60000;
        }

        public void recordError(String errorType, String detail) {
            this.totalErrors++;
            Integer count = this.errorsByType.containsKey(errorType)
                ? this.errorsByType.get(errorType) + 1 : 1;
            this.errorsByType.put(errorType, count);
            if (this.errorDetails.size() < 100) {
                this.errorDetails.add(errorType + ': ' + detail);
            }
        }
    }

    private BatchConfig config;
    private BatchMetrics metrics;

    public UTL_BatchProcessor_716(BatchConfig config) {
        this.config = config;
        this.metrics = new BatchMetrics();
    }

    public UTL_BatchProcessor_716() {
        this(new BatchConfig('SELECT Id FROM Lead LIMIT 0'));
    }

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(this.config.query);
    }

    public void execute(Database.BatchableContext bc, List<Lead> scope) {
        this.metrics.totalBatches++;
        Map<Id, Lead> recordsToUpdate = new Map<Id, Lead>();

        for (Lead record : scope) {
            try {
                Boolean shouldProcess = true;
                if (this.config.parameters.containsKey('filter')) {
                    String filterField = this.config.parameters.get('filter');
                    Object fieldValue = record.get(filterField);
                    if (fieldValue == null) {
                        shouldProcess = false;
                    } else if (fieldValue instanceof String && String.isBlank((String) fieldValue)) {
                        shouldProcess = false;
                    }
                }

                if (shouldProcess) {
                    Map<String, Object> updates = processRecord(record);
                    if (updates != null && !updates.isEmpty()) {
                        for (String field : updates.keySet()) {
                            record.put(field, updates.get(field));
                        }
                        recordsToUpdate.put(record.Id, record);
                    }
                    this.metrics.totalProcessed++;
                }
            } catch (Exception ex) {
                this.metrics.recordError(ex.getTypeName(), record.Id + ': ' + ex.getMessage());
            }
        }

        if (!recordsToUpdate.isEmpty()) {
            Database.SaveResult[] results = Database.update(recordsToUpdate.values(), false);
            for (Integer i = 0; i < results.size(); i++) {
                if (!results[i].isSuccess()) {
                    for (Database.Error err : results[i].getErrors()) {
                        this.metrics.recordError('DML', err.getStatusCode() + ': ' + err.getMessage());
                    }
                }
            }
        }
    }

    public void finish(Database.BatchableContext bc) {
        this.metrics.endTimeMs = System.currentTimeMillis();
        if (this.config.sendNotification && !this.config.recipientIds.isEmpty()) {
            sendCompletionEmail();
        }
    }

    public void execute(SchedulableContext sc) {
        Database.executeBatch(this, this.config.scopeSize);
    }

    private Map<String, Object> processRecord(Lead record) {
        return new Map<String, Object>();
    }

    private void sendCompletionEmail() {
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setToAddresses(this.config.recipientIds);
        email.setSubject('UTL_BatchProcessor_716 Batch Complete');
        email.setPlainTextBody(
            'Processed: ' + this.metrics.totalProcessed +
            '\nErrors: ' + this.metrics.totalErrors +
            '\nDuration: ' + this.metrics.getDurationMinutes().setScale(2) + ' min'
        );
        try { Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ email }); } catch (Exception ex) { /* log */ }
    }
}
