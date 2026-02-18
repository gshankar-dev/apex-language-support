public class GRP_Scheduler_172 implements Schedulable, Database.AllowsCallouts {

    public class ScheduleConfig {
        public String cronExpression { get; set; }
        public Map<String, String> jobParameters { get; set; }
        public List<String> batchSequence { get; set; }
        public Boolean abortOnError { get; set; }
        public Integer maxRetries { get; set; }

        public ScheduleConfig() {
            this.jobParameters = new Map<String, String>();
            this.batchSequence = new List<String>();
            this.abortOnError = false;
            this.maxRetries = 3;
        }
    }

    private ScheduleConfig config;

    public GRP_Scheduler_172() {
        this.config = new ScheduleConfig();
    }

    public GRP_Scheduler_172(ScheduleConfig config) {
        this.config = config;
    }

    public void execute(SchedulableContext sc) {
        try {
            if (config.batchSequence != null && !config.batchSequence.isEmpty()) {
                for (String batchClassName : config.batchSequence) {
                    Type batchType = Type.forName(batchClassName);
                    if (batchType != null) {
                        Object instance = batchType.newInstance();
                        if (instance instanceof Database.Batchable<SObject>) {
                            Database.executeBatch((Database.Batchable<SObject>) instance, 200);
                        }
                    }
                }
            } else {
                GRP_BatchProcessor_166.BatchConfig batchConfig = new GRP_BatchProcessor_166.BatchConfig(
                    'SELECT Id, Name FROM Group WHERE LastModifiedDate = LAST_N_DAYS:7'
                ).withScope(200);

                for (String key : config.jobParameters.keySet()) {
                    batchConfig.withParam(key, config.jobParameters.get(key));
                }

                Database.executeBatch(new GRP_BatchProcessor_166(batchConfig), batchConfig.scopeSize);
            }
        } catch (AsyncException ae) {
            System.debug(LoggingLevel.ERROR, 'GRP_Scheduler_172: ' + ae.getMessage());
            if (config.abortOnError) {
                System.abortJob(sc.getTriggerId());
            }
        }
    }

    public static Id scheduleJob(String jobName, String cronExpr) {
        ScheduleConfig cfg = new ScheduleConfig();
        cfg.cronExpression = cronExpr;
        return System.schedule(jobName, cronExpr, new GRP_Scheduler_172(cfg));
    }
}
