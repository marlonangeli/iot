package iot.logi.api.controllers;

import iot.logi.api.dtos.TransactionDto;
import iot.logi.api.models.Transaction;
import iot.logi.api.services.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transactions")
public class TransactionsController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionsController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Transaction> createTransaction(
            @Valid @RequestBody TransactionDto transactionDto
    ) {
        Transaction transaction = transactionService.createTransaction(transactionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransaction(@PathVariable Long id) {
        Transaction transaction = transactionService.findTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/{id}/distance")
    public ResponseEntity<Double> getDistance(@PathVariable Long id) {
        Double distance = transactionService.calculateDistanceBetweenLocations(id);
        return ResponseEntity.ok(distance);
    }


    @GetMapping
    public ResponseEntity<Page<Transaction>> getAllTransactions(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<Transaction> transactions = transactionService.findAllTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDto transactionDto
    ) {
        Transaction transaction = transactionService.updateTransaction(id, transactionDto);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
