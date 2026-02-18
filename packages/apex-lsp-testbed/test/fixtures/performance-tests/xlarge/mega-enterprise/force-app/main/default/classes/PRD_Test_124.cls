@isTest
private class PRD_Test_124 {

    private class MockProcessor extends PRD_BaseService_113.RecordProcessor {
        private List<Id> processedIds;

        public MockProcessor(PRD_BaseService_113.ServiceConfig config) {
            super(config);
            this.processedIds = new List<Id>();
        }

        protected override Boolean shouldProcess(Product2 record) {
            return record.Id != null;
        }

        protected override Product2 processRecord(Product2 record, Map<Id, Product2> allRecords) {
            this.processedIds.add(record.Id);
            return record;
        }
    }

    @TestSetup
    static void setupTestData() {
        List<Product2> records = new List<Product2>();
        for (Integer i = 0; i < 50; i++) {
            records.add(new Product2(
                Name = 'Test Record ' + String.valueOf(i).leftPad(4, '0')
            ));
        }
        insert records;
    }

    @isTest
    static void testServiceExecution() {
        List<Product2> records = [SELECT Id, Name FROM Product2 LIMIT 10];
        PRD_BaseService_113.ServiceConfig config = new PRD_BaseService_113.ServiceConfig()
            .withCaching(true)
            .withBatchSize(100)
            .withOption('mode', 'test')
            .excludeField('OwnerId');

        Test.startTest();
        PRD_RecordService_113 service = new PRD_RecordService_113();
        PRD_BaseService_113.ServiceResult result = service.execute(records, config);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.success, 'Execution should succeed: ' + String.join(result.errors, ', '));
    }

    @isTest
    static void testServiceWithErrors() {
        PRD_BaseService_113.ServiceConfig config = new PRD_BaseService_113.ServiceConfig();
        PRD_BaseService_113.ServiceResult result = new PRD_BaseService_113.ServiceResult();
        result.addError('Test error');
        result.addFieldError('Name', null, 'Invalid name');

        System.assertEquals(false, result.success, 'Should be failed');
        System.assertEquals(1, result.errors.size(), 'Should have one error');
        System.assert(result.fieldErrors.containsKey('Name'), 'Should have field error');
    }

    @isTest
    static void testMockProcessor() {
        List<Product2> records = [SELECT Id, Name FROM Product2 LIMIT 5];
        PRD_BaseService_113.ServiceConfig config = new PRD_BaseService_113.ServiceConfig()
            .withBatchSize(50);

        MockProcessor processor = new MockProcessor(config);

        Test.startTest();
        PRD_BaseService_113.ServiceResult result = processor.process(records);
        Test.stopTest();

        System.assertEquals(records.size(), processor.processedIds.size(), 'All records should be processed');
        System.assertEquals(records.size(), result.recordsProcessed, 'Count should match');
    }

    @isTest
    static void testConfigBuilder() {
        PRD_BaseService_113.ServiceConfig config = new PRD_BaseService_113.ServiceConfig()
            .withCaching(false)
            .withBatchSize(50)
            .withOption('key1', 'value1')
            .withOption('key2', 'value2')
            .excludeField('Field1')
            .excludeField('Field2');

        System.assertEquals(false, config.enableCaching, 'Caching should be disabled');
        System.assertEquals(50, config.batchSize, 'Batch size should be 50');
        System.assertEquals(2, config.options.size(), 'Should have 2 options');
        System.assertEquals(2, config.excludedFields.size(), 'Should have 2 excluded fields');
    }

    @isTest
    static void testServiceResultChaining() {
        PRD_BaseService_113.ServiceResult result = new PRD_BaseService_113.ServiceResult();
        Product2 testRecord = [SELECT Id FROM Product2 LIMIT 1];

        result.recordProcessed(testRecord.Id, testRecord)
            .addFieldError('Status', testRecord.Id, 'Invalid status')
            .addFieldError('Status', testRecord.Id, 'Another error')
            .addError('General error');

        System.assertEquals(false, result.success);
        System.assertEquals(1, result.errors.size());
        System.assertEquals(1, result.processedRecords.size());
        System.assert(result.fieldErrors.containsKey('Status'));
        System.assertEquals(2, result.fieldErrors.get('Status').get(testRecord.Id).size());
    }
}
