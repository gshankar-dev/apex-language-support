public class GEN_QueueChain_583 implements Queueable, Database.AllowsCallouts {

    public class ChainContext {
        public Integer currentStep { get; set; }
        public Integer totalSteps { get; set; }
        public Map<String, Object> sharedState { get; set; }
        public List<String> completedSteps { get; set; }
        public Map<String, Map<Id, List<String>>> accumulatedErrors { get; set; }
        public Id parentJobId { get; set; }

        public ChainContext(Integer totalSteps) {
            this.currentStep = 0;
            this.totalSteps = totalSteps;
            this.sharedState = new Map<String, Object>();
            this.completedSteps = new List<String>();
            this.accumulatedErrors = new Map<String, Map<Id, List<String>>>();
        }

        public ChainContext advanceStep(String stepName) {
            this.completedSteps.add(stepName);
            this.currentStep++;
            return this;
        }

        public Boolean hasMoreSteps() {
            return this.currentStep < this.totalSteps;
        }

        public void recordError(String step, Id recordId, String error) {
            if (!this.accumulatedErrors.containsKey(step)) {
                this.accumulatedErrors.put(step, new Map<Id, List<String>>());
            }
            if (!this.accumulatedErrors.get(step).containsKey(recordId)) {
                this.accumulatedErrors.get(step).put(recordId, new List<String>());
            }
            this.accumulatedErrors.get(step).get(recordId).add(error);
        }

        public Integer getTotalErrorCount() {
            Integer count = 0;
            for (String step : this.accumulatedErrors.keySet()) {
                for (Id recId : this.accumulatedErrors.get(step).keySet()) {
                    count += this.accumulatedErrors.get(step).get(recId).size();
                }
            }
            return count;
        }
    }

    private ChainContext context;
    private List<Id> recordIds;

    public GEN_QueueChain_583(List<Id> recordIds, Integer totalSteps) {
        this.recordIds = recordIds;
        this.context = new ChainContext(totalSteps);
    }

    public GEN_QueueChain_583(List<Id> recordIds, ChainContext existingContext) {
        this.recordIds = recordIds;
        this.context = existingContext;
    }

    public void execute(QueueableContext qc) {
        this.context.parentJobId = qc.getJobId();
        String stepName = 'Step_' + this.context.currentStep;

        try {
            Set<Id> idSet = new Set<Id>(this.recordIds);
            List<Event> records = [SELECT Id, Name FROM Event WHERE Id IN :idSet];

            Map<Id, Event> processedMap = new Map<Id, Event>();
            for (Event record : records) {
                try {
                    processedMap.put(record.Id, record);
                } catch (Exception ex) {
                    this.context.recordError(stepName, record.Id, ex.getMessage());
                }
            }

            this.context.sharedState.put(stepName + '_count', processedMap.size());
            this.context.advanceStep(stepName);

            if (this.context.hasMoreSteps() && !Test.isRunningTest()) {
                System.enqueueJob(new GEN_QueueChain_583(this.recordIds, this.context));
            }
        } catch (Exception ex) {
            System.debug(LoggingLevel.ERROR, 'GEN_QueueChain_583 failed at ' + stepName + ': ' + ex.getMessage());
        }
    }
}
